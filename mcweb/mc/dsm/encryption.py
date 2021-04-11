import hashlib

from Crypto.Cipher import AES
from OpenSSL import crypto
from bitstring import BitStream
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding


def generate_keypair():
    # create a key pair
    k = crypto.PKey()
    k.generate_key(crypto.TYPE_RSA, 1024)

    # create a self-signed cert
    cert = crypto.X509()
    cert.get_subject().C = "DE"
    cert.get_subject().ST = "Mecklenburg Vorpommern"
    cert.get_subject().L = "Greifswald"
    cert.get_subject().O = "MCWeb Server"
    cert.get_subject().OU = "DSM-Server"
    cert.get_subject().CN = "MCWeb DSM Server"
    cert.set_serial_number(1000)
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(10 * 365 * 24 * 60 * 60)
    cert.set_issuer(cert.get_subject())
    cert.set_pubkey(k)
    cert.sign(k, 'sha256')

    public_key = cert.get_pubkey()
    # public_key, private_key
    return crypto.dump_publickey(crypto.FILETYPE_ASN1, public_key), crypto.dump_privatekey(crypto.FILETYPE_ASN1, k)


def generate_login_hash(server_id, secret, public_key):
    # generate login hash like shown in https://wiki.vg/Protocol_Encryption#Client
    h = hashlib.sha1()
    h.update(server_id.decode("iso-8859-1").encode())
    h.update(secret)
    h.update(public_key)
    return minecraft_hex(h.digest())


def minecraft_hex(by):
    return format(BitStream(by).read("int"), "x")


def fit_to_secret_lenght(packet, secret):
    add = len(secret) - (len(packet) % len(secret))
    return packet + b" " + bytes(add)


def create_cipher(secret):
    # create new AES/CFB Cipher
    return AES.new(secret, AES.MODE_CFB, iv=secret)


def decode_token_and_secret(private_key, enc_token, enc_secret):
    private_key = serialization.load_der_private_key(private_key, password=None)
    secret = private_key.decrypt(enc_secret, padding=padding.PKCS1v15())
    token = private_key.decrypt(enc_token, padding=padding.PKCS1v15())
    return token, secret

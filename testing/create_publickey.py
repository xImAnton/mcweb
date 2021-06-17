from OpenSSL import crypto
from os.path import exists, join

CERT_FILE = "myapp.crt"
KEY_FILE = "myapp.key"


def create_self_signed_cert(cert_dir):
    if not exists(join(cert_dir, CERT_FILE)) or not exists(join(cert_dir, KEY_FILE)):
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

        open(join(cert_dir, CERT_FILE), "wb").write(
            crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
        open(join(cert_dir, KEY_FILE), "wb").write(
            crypto.dump_privatekey(crypto.FILETYPE_PEM, k))


create_self_signed_cert(".")

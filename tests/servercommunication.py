import subprocess
import threading
import sys


def print_stdout(proc):
    while proc.poll() is None:
        for stdline in iter(proc.stdout.readline, ""):
            sys.stdout.write(stdline.decode())


def redirect_input(proc):
    while proc.poll() is None:
        s = input("> ")
        proc.stdin.write(s.encode("ascii") + b'\n')
        proc.stdin.flush()


proc = subprocess.Popen("java -Xmx2G -jar server.jar --nogui", stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd="./run")

output_redirector = threading.Thread(target=print_stdout, args=[proc])
input_redirector = threading.Thread(target=redirect_input, args=[proc], daemon=True)
output_redirector.start()
input_redirector.start()

while proc.poll() is None:
    pass

print("ended")

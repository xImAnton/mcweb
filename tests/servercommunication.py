import subprocess
import threading
import sys


class Communicator(threading.Thread):
    def __init__(self, process):
        super().__init__()
        self.process: subprocess.Popen = process

    def run(self) -> None:
        while self.process.poll() is None:
            for stdline in iter(self.process.stdout.readline, ""):
                sys.stdout.write(stdline.decode())


proc = subprocess.Popen("java -Xmx2G -jar server.jar --nogui", stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd="./run")

communicator = Communicator(proc)
communicator.start()

while proc.poll() is None:
    s = input("> ")
    proc.stdin.write(s.encode("ascii") + b'\n')
    proc.stdin.flush()

print("ended")

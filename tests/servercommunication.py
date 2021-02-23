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

    def send_cmd(self, cmd):
        # self.process.stdin.write(cmd.encode("utf-8"))
        self.process.stdin.write(cmd.encode("utf-8"))
        self.process.wait(timeout=2)


proc = subprocess.Popen("java -Xmx2G -jar server.jar --nogui", stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd="./run")

communicator = Communicator(proc)
communicator.start()

while proc.poll() is None:
    s = input("> ")
    communicator.send_cmd(s)

print("ended")

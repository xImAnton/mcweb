import subprocess
import threading


class ServerCommunication(threading.Thread):
    """
    A class for abstracting away sending commands to and receiving output from the server
    """
    def __init__(self, command, cwd=".", on_output=lambda line: print(line), on_close=lambda: print("server communication ended")):
        """
        :param command: the command to start the server with
        :param cwd: the working directory for the server
        :param on_output: called with the line as only argument on server console output
        :param on_close: called when the server closed
        """
        super().__init__()
        self.command = command
        self.cwd = cwd
        self.process = None
        self.on_output = on_output
        self.on_close = on_close

    def begin(self):
        """
        starts the server
        """
        self.process = subprocess.Popen(self.command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd=self.cwd)
        self.start()

    def run(self) -> None:
        """
        calls the on_output callback for every line on the server output while it's running
        """
        while self.process.poll() is None:
            for line in iter(self.process.stdout.readline, ""):
                self.on_output(line)
        self.on_close()

    def write_stdin(self, cmd):
        """
        writes a command to server stdin and flushes it
        :param cmd: the command to send
        """
        self.process.stdin.write(cmd.encode("ascii") + b'\n')
        self.process.stdin.flush()

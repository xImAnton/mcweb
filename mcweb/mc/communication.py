import subprocess
import threading


class ServerCommunication:
    """
    A class for abstracting away sending commands to and receiving output from the server
    """
    def __init__(self, command, cwd=".", on_output=lambda line: print(line, end=""), on_close=lambda: print("server communication ended"), on_stderr=lambda line: print(line, end="")):
        """
        :param command: the command to start the server with
        :param cwd: the working directory for the server
        :param on_output: called with the line as only argument on server console output
        :param on_close: called when the server closed
        """
        self.command = command
        self.cwd = cwd
        self.process = None
        self.on_output = on_output
        self.on_close = on_close
        self.running = False
        self.on_stderr = on_stderr

    def begin(self) -> None:
        """
        starts the server
        """
        self.process = subprocess.Popen(self.command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd=self.cwd, stderr=subprocess.PIPE)
        self.running = True
        t = threading.Thread(target=self.stdout_loop)
        t.start()
        t1 = threading.Thread(target=self.stderr_loop)
        t1.start()

    def stdout_loop(self) -> None:
        """
        calls the on_output callback for every line on the server output while it's running
        """
        for line in iter(self.process.stdout.readline, ""):
            if self.process.poll() is not None:
                break
            if line:
                self.on_output(line.decode())
        self.running = False
        self.on_close()

    def stderr_loop(self) -> None:
        for line in iter(self.process.stderr.readline, ""):
            if self.process.poll() is not None:
                break
            if line:
                self.on_stderr(line.decode())

    def write_stdin(self, cmd) -> None:
        """
        writes a command to server stdin and flushes it
        :param cmd: the command to send
        """
        if not self.running:
            return
        self.process.stdin.write(cmd.encode("ascii") + b'\n')
        self.process.stdin.flush()

import asyncio
import subprocess
import threading
import locale


class ServerCommunication:
    """
    A class for abstracting away sending commands to and receiving output from the server
    """
    __slots__ = "loop", "command", "cwd", "process", "on_output", "on_close", "running", "on_stderr", "shell"

    def __init__(self, loop, command, on_output, on_stderr, on_close, cwd=".", shell=False):
        """
        :param command: the command to start the server with
        :param cwd: the working directory for the server
        :param on_output: called with the line as only argument on server console output
        :param on_close: called when the server closed
        """
        self.loop = loop
        self.command = command
        self.cwd = cwd
        self.process = None
        self.on_output = on_output
        self.on_close = on_close
        self.running = False
        self.on_stderr = on_stderr
        self.shell = shell

    async def begin(self) -> None:
        """
        starts the server
        """
        self.process = subprocess.Popen(self.command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd=self.cwd, stderr=subprocess.PIPE, shell=self.shell)
        self.running = True
        AsyncStreamWatcher(self.loop, self.process.stdout, self.process, self.on_output, self.on_close).start()
        AsyncStreamWatcher(self.loop, self.process.stdout, self.process, self.on_stderr, None).start()

    async def process_end(self):
        self.running = False
        await self.on_close()

    def write_stdin_sync(self, cmd):
        """
        writes a command to server stdin and flushes it
        :param cmd: the command to send
        """
        if not self.running:
            return

        line = str(cmd).encode(locale.getpreferredencoding()) + b'\n'
        self.process.stdin.write(line)
        self.process.stdin.flush()

    async def write_stdin(self, cmd) -> None:
        self.write_stdin_sync(cmd)


class AsyncStreamWatcher(threading.Thread):
    __slots__ = "loop", "stream", "proc", "on_close", "on_out"

    def __init__(self, loop, stream, proc, on_out, on_close):
        super(AsyncStreamWatcher, self).__init__()
        self.loop = loop
        self.stream = stream
        self.proc = proc
        self.on_close = on_close
        self.on_out = on_out

    def run(self) -> None:
        for line in iter(self.stream.readline, ""):
            if self.proc.poll() is not None:
                break
            if line:
                line = line.decode(locale.getpreferredencoding())
                asyncio.run_coroutine_threadsafe(self.on_out(line), self.loop)
        if self.on_close is not None:
            asyncio.run_coroutine_threadsafe(self.on_close(), self.loop)

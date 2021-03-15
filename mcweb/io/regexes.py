import re


class Regexes:
    TIMINGS_RESET_PAPER = re.compile(r"^\[[0-9]+:[0-9]+:[0-9]+ .*\]: Timings Reset$")
    ADVANCED_TERMINAL_FEATURES = re.compile(r"^[0-9]*-[0-9]*-[0-9]* [0-9]*:[0-9]*:[0-9]*,[0-9]* main WARN Advanced terminal features are not available in this environment$")
    DONE_FORGE = re.compile(r'^\[[0-9]*:[0-9]*:[0-9]*\] \[.*\]: Done \([0-9]*\.[0-9]*s\)! For help, type "help"$')
    USER_NAME = re.compile(r"^[a-z0-9A-Z_-]{6,15}$")
    USER_MAIL = re.compile(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$")

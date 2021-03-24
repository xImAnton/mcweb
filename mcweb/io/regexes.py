import re


class Regexes:
    ADVANCED_TERMINAL_FEATURES = re.compile(r"^[0-9]*-[0-9]*-[0-9]* [0-9]*:[0-9]*:[0-9]*,[0-9]* main WARN Advanced terminal features are not available in this environment$")
    DONE = re.compile(r'^(\[[0-9]+:[0-9]+:[0-9]+ .*\]: Timings Reset)|(\[[0-9]*:[0-9]*:[0-9]*\] \[Server thread\/INFO\]: Time elapsed: [0-9]* ms)|(\[[0-9]*:[0-9]*:[0-9]*\] \[.*\]: Done \([0-9]*[\.,][0-9]*s\)! For help, type "help"( or "\?")?)$')
    SERVER_DISPLAY_NAME = re.compile(r"^[a-zA-Z0-9_\-\. ]{3,48}$")
    USER_NAME = re.compile(r"^[a-z0-9A-Z_-]{6,15}$")
    USER_MAIL = re.compile(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$")

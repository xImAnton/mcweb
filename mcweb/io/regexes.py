import re


class Regexes:
    DONE = re.compile(r'^(\[[0-9]+:[0-9]+:[0-9]+ .*\]: Timings Reset)|(\[[0-9]*:[0-9]*:[0-9]*\] \[Server thread\/INFO\]: Time elapsed: [0-9]* ms)|(\[[0-9]*:[0-9]*:[0-9]*\] \[.*\]: Done \([0-9]*[\.,][0-9]*s\)! For help, type "help"( or "\?")?)$')
    SERVER_DISPLAY_NAME = re.compile(r"^[a-zA-Z0-9_\-\. ]+$")
    USER_NAME = re.compile(r"^[a-z0-9A-Z_-]{6,15}$")
    USER_MAIL = re.compile(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$")
    IP = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")

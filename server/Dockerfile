FROM centos:7

RUN yum update -y
RUN yum install -y wget

# install java 1.8
RUN yum install -y java-1.8.0-openjdk

# install python
RUN yum install python3 -y \
&& pip3 install --upgrade pip setuptools wheel \
&& if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi \
&& if [[ ! -e /usr/bin/python ]]; then ln -sf /usr/bin/python3 /usr/bin/python; fi \
&& yum clean all \
&& rm -rf /var/cache/yum

WORKDIR /app
COPY . .

RUN pip3 install -r requirements.txt

# set encoding to utf-8
ENV LC_ALL=en_US.utf8
ENV LANG="$LC_ALL"
ENV PYTHONIOENCODING=utf8

EXPOSE $BACKEND_PORT
CMD ["python3", "./run.py"]

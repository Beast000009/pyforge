FROM python:3.12-slim

# Tools used across labs: real socket clients/servers, packet capture-lite, HTTP, JSON,
# binary inspection, and a couple of editors so users can drop to the terminal.
RUN apt-get update && apt-get install -y --no-install-recommends \
      bash \
      ca-certificates \
      curl \
      nano \
      vim-tiny \
      iproute2 \
      iputils-ping \
      netcat-openbsd \
      net-tools \
      procps \
      dnsutils \
      file \
      tree \
      jq \
      xxd \
    && rm -rf /var/lib/apt/lists/*

# Python deps used by lab exercises
RUN pip install --no-cache-dir \
      requests==2.32.3 \
      beautifulsoup4==4.12.3 \
      lxml==5.2.2 \
      scapy==2.5.0

# AST gate — baked into the image so every container can validate user code
COPY ast-check.py /usr/local/bin/pyforge-ast-check
RUN chmod +x /usr/local/bin/pyforge-ast-check

# Non-root user — containers run with --user lab
RUN useradd -m -u 1000 -s /bin/bash lab \
    && mkdir -p /workdir \
    && chown lab:lab /workdir

WORKDIR /workdir
USER lab

# default shell — but lab-server `exec`s into this with explicit Cmd
CMD ["/bin/bash", "-l"]

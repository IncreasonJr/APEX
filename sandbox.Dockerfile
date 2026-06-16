# Safe execution sandbox for python, node, and bash
FROM python:3.10-slim

# Install NodeJS minimal packages
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user 'sandbox' with no sudo privileges
# Sets working directory to /sandbox
RUN useradd -m -d /sandbox sandbox && \
    chown -R sandbox:sandbox /sandbox

USER sandbox
WORKDIR /sandbox

# Read-only by default (this can be mounted at runtime with read-only parameter)
CMD ["python3"]

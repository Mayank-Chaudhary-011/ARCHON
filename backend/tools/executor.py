import docker
import tempfile
import os


def run_code_in_sandbox(code: str) -> dict:
    """Run a single Python file string inside the Docker sandbox."""
    client = docker.from_env()

    with tempfile.TemporaryDirectory() as tmpdir:
        code_file = os.path.join(tmpdir, "solution.py")

        with open(code_file, "w") as f:
            f.write(code)

        try:
            container = client.containers.run(
                image="code-sandbox",
                command="python /code/solution.py",
                volumes={
                    tmpdir: {
                        "bind": "/code",
                        "mode": "rw"
                    }
                },
                mem_limit="128m",
                cpu_period=100000,
                cpu_quota=50000,
                network_disabled=True,
                remove=True,
                stdout=True,
                stderr=True
            )

            output = container.decode("utf-8").strip()

            # Detect Python runtime errors printed to stdout
            if "Traceback" in output or "Error" in output:
                return {
                    "success": False,
                    "output":  None,
                    "error":   output
                }

            return {
                "success": True,
                "output":  output,
                "error":   None
            }

        except docker.errors.ContainerError as e:
            return {
                "success": False,
                "output":  None,
                "error":   e.stderr.decode("utf-8").strip()
            }
        except Exception as e:
            return {
                "success": False,
                "output":  None,
                "error":   str(e)
            }


def run_project_in_sandbox(files: dict, entry_point: str) -> dict:
    """
    Run a multi-file project inside the Docker sandbox.

    All generated files are written to a shared temp directory so that
    local imports (e.g. `from data_loader import load_data`) resolve
    correctly at runtime — identical to running locally.

    Args:
        files:       dict mapping filename -> code string for every generated file.
        entry_point: the filename to execute (e.g. "main.py" or "solution.py").

    Returns:
        dict with keys: success (bool), output (str|None), error (str|None)
    """
    client = docker.from_env()

    with tempfile.TemporaryDirectory() as tmpdir:
        # Write every file into the shared temp directory
        for filename, code in files.items():
            filepath = os.path.join(tmpdir, filename)
            # Support subdirectories like "src/utils.py"
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "w") as f:
                f.write(code)

        try:
            container = client.containers.run(
                image="code-sandbox",
                command=f"python /code/{entry_point}",
                volumes={
                    tmpdir: {
                        "bind": "/code",
                        "mode": "rw"
                    }
                },
                mem_limit="128m",
                cpu_period=100000,
                cpu_quota=50000,
                network_disabled=True,
                remove=True,
                stdout=True,
                stderr=True
            )

            output = container.decode("utf-8").strip()

            # Detect Python runtime errors printed to stdout
            if "Traceback" in output or "Error" in output:
                return {
                    "success": False,
                    "output":  None,
                    "error":   output
                }

            return {
                "success": True,
                "output":  output,
                "error":   None
            }

        except docker.errors.ContainerError as e:
            return {
                "success": False,
                "output":  None,
                "error":   e.stderr.decode("utf-8").strip()
            }
        except Exception as e:
            return {
                "success": False,
                "output":  None,
                "error":   str(e)
            }

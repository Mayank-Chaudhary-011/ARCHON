import docker
import tempfile
import os 

def run_code_in_sandbox(code:str) -> dict:
    client = docker.from_env()


    # Write code to a temp file
    with tempfile.TemporaryDirectory() as tmpdir:
        code_file = os.path.join(tmpdir , "solution.py")


        with open(code_file ,"w") as f:
            f.write(code)

        try:
            # Run code inside sandbox
            container = client.containers.run(
                image="code-sandbox",
                command="python /code/solution.py",
                volumes={
                    tmpdir:{
                        "bind":"/code",
                        "mode":"rw"
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

            return {
                "success":True,
                "output":output,
                "error":None
            }
        except docker.errors.ContainerError as e:
            return{
                "success":False,
                "output":None,
                "error":e.stderr.decode("utf-8").strip()
            }
        except Exception as e:
            return{
                "success":False,
                "output":None,
                "error":str(e)
            }

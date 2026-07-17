import requests

BASE = "http://localhost:8000/api"

# Test 1 — health check
print("=== HEALTH CHECK ===")
r = requests.get(f"{BASE}/health")
print(r.json())

# Test 2 — generate mode
print("\n=== GENERATE MODE ===")
r = requests.post(f"{BASE}/run", json={
    "task": "Write a Python function that finds the factorial of a number and prints the result for 5"
})
result = r.json()
print(f"Status  : {result['status']}")
print(f"Attempts: {result['attempts']}")
print(f"Output  : {result['output']}")
print(f"Code    :\n{result['code']}")

# Test 3 — debug mode
print("\n=== DEBUG MODE ===")
r = requests.post(f"{BASE}/debug", json={
    "broken_code": """
def factorial(n)
    if n == 0:
        return 1
    return n * factorial(n-1)
print(factorial(5))
""",
    "error_message": "SyntaxError: expected ':'"
})
result = r.json()
print(f"Status    : {result['status']}")
print(f"Attempts  : {result['attempts']}")
print(f"Output    : {result['output']}")
print(f"Fixed code:\n{result['fixed_code']}")
from typing import TypedDict

class AgentState(TypedDict, total=False):
    task:              str
    mode:              str
    plan:              str
    implementation:    dict   # architecture, tech stack, files
    files:             list   # list of files to generate
    current_file:      str    # which file is being generated now
    generated_files:   dict   # filename -> code
    code:              str
    broken_code:       str
    error_message:     str
    feedback:          str
    attempts:          int
    approved:          bool
    final_output:      str
    tokens_used:       int
    prompt_tokens:     int
    completion_tokens: int
    efficiency_score:  float
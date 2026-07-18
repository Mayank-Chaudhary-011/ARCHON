from typing import TypedDict

class AgentState(TypedDict, total=False):
    task:              str
    mode:              str
    api_key:           str    # user-supplied OpenAI API key (passed from frontend)
    llm_provider:      str    # OpenAI, Grok, or Custom
    base_url:          str    # custom API base endpoint URL
    model_planner:     str    # model name for planner/critic
    model_coder:       str    # model name for coder
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
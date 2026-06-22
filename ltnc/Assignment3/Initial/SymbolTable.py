from StaticError import *
from Symbol import *
from functools import *

def is_identifier(s):
    if not s:
        return False
    if not ('a' <= s[0] <= 'z'):
        return False
    return all('a' <= c <= 'z' or 'A' <= c <= 'Z' or '0' <= c <= '9' or c == '_' for c in s[1:])

def is_number_literal(s):
    return len(s) > 0 and all(map(str.isdigit, s))

def is_string_literal(s):
    if not (s.startswith("'") and s.endswith("'") and len(s) >= 2):
        return False
    content = s[1:-1]
    return all('a' <= c <= 'z' or 'A' <= c <= 'Z' or '0' <= c <= '9' for c in content)

def get_value_type(value_str, scope_stack):
    if is_number_literal(value_str):
        return "number"
    elif is_string_literal(value_str):
        return "string"
    elif is_identifier(value_str):
        symbol_info = lookup_symbol(scope_stack, value_str)
        if symbol_info is None:
             raise Undeclared(value_str)
        return symbol_info[0].typ
    else:
        return None

def lookup_symbol(scope_stack, search_name):
    def find_in_scopes_recursive(scopes_with_levels_reversed):
        if not scopes_with_levels_reversed:
            return None
        def find_from_deepest_recursive(current_scope_slice_deep_to_shallow):
            if not current_scope_slice_deep_to_shallow:
                return None
            current_scope, current_level = current_scope_slice_deep_to_shallow[0]
            found_symbol = next((s for s in current_scope if s.name == search_name), None)
            if found_symbol:
                return (found_symbol, current_level)
            else:
                return find_from_deepest_recursive(current_scope_slice_deep_to_shallow[1:])
        scopes_with_levels = [(scope_stack[i], i) for i in range(len(scope_stack))]
        scopes_deep_to_shallow = scopes_with_levels[::-1]
        return find_from_deepest_recursive(scopes_deep_to_shallow)
    return find_in_scopes_recursive(scope_stack)

def collect_visible_symbols(scope_stack):
    def collect(scopes_with_levels, seen_names):
        if not scopes_with_levels:
            return []
        current_scope, current_level = scopes_with_levels[0]
        rest_scopes = scopes_with_levels[1:]
        newly_visible = [s for s in current_scope if s.name not in seen_names]
        new_seen = seen_names | {s.name for s in newly_visible}
        outer_visible = collect(rest_scopes, new_seen)
        return outer_visible + [(s, current_level) for s in newly_visible]
    scopes_with_levels = [(scope, level) for level, scope in enumerate(scope_stack)]
    scopes_from_inner_to_outer = list(reversed(scopes_with_levels))
    return collect(scopes_from_inner_to_outer, set())

def handle_insert(state, insert_name, insert_type, instruction):
    scope_stack, results, level = state
    current_scope = scope_stack[-1]
    is_redeclared = any(s.name == insert_name for s in current_scope)
    if is_redeclared:
        raise Redeclared(instruction)
    new_symbol = Symbol(insert_name, insert_type)
    new_current_scope = current_scope + [new_symbol]
    new_scope_stack = scope_stack[:-1] + [new_current_scope]
    new_results = results + ["success"]
    return (new_scope_stack, new_results, level)

def handle_assign(state, assign_name, assign_value_str, instruction):
    scope_stack, results, level = state
    if not (is_number_literal(assign_value_str) or is_string_literal(assign_value_str) or is_identifier(assign_value_str)):
        raise InvalidInstruction(instruction)
    
    name_symbol_info = lookup_symbol(scope_stack, assign_name)
    if name_symbol_info is None:
        raise Undeclared(instruction)
    name_symbol_type = name_symbol_info[0].typ

    try:
        value_type = get_value_type(assign_value_str, scope_stack)
    except Undeclared as e:
        raise Undeclared(instruction)

    if value_type is None or name_symbol_type != value_type:
        raise TypeMismatch(instruction)
    new_results = results + ["success"]
    return (scope_stack, new_results, level)

def handle_begin(state):
    scope_stack, results, level = state
    new_scope_stack = scope_stack + [[]]
    new_level = level + 1
    return (new_scope_stack, results, new_level)

def handle_end(state, instruction):
    scope_stack, results, level = state
    if level == 0:
        raise UnknownBlock()
    new_scope_stack = scope_stack[:-1]
    new_level = level - 1
    return (new_scope_stack, results, new_level)

def handle_lookup(state, lookup_name, instruction):
    scope_stack, results, level = state
    symbol_info = lookup_symbol(scope_stack, lookup_name)
    if symbol_info is None:
        raise Undeclared(instruction)
    else:
        found_level = symbol_info[1]
        new_results = results + [str(found_level)]
        return (scope_stack, new_results, level)

def handle_print(state):
    scope_stack, results, level = state
    visible_symbols = collect_visible_symbols(scope_stack)
    formatted = [f"{s.name}//{lvl}" for s, lvl in visible_symbols]
    rprint_output = " ".join(formatted)
    return (scope_stack, results + [rprint_output], level)

def handle_rprint(state):
    scope_stack, results, level = state
    visible_symbols = collect_visible_symbols(scope_stack)
    visible_symbols_ordered = reversed(visible_symbols)
    formatted = [f"{s.name}//{lvl}" for s, lvl in visible_symbols_ordered]
    print_output = " ".join(formatted)
    return (scope_stack, results + [print_output], level)

def simulate(list_of_commands):
    initial_state = ([[]], [], 0)
    def process_command(state, instruction):
        stripped_instruction = instruction.strip()
        if stripped_instruction != instruction:
            raise InvalidInstruction(instruction)
        parts = stripped_instruction.split(" ", 2)
        command_type = parts[0]
        try:
            if command_type == "INSERT":
                if len(parts) != 3:
                    raise InvalidInstruction(instruction)
                insert_name = parts[1]
                insert_type = parts[2]
                if (" " in insert_name) or (" " in insert_type):
                    raise InvalidInstruction(instruction)
                if not is_identifier(insert_name) or (insert_type not in ("number", "string")):
                    raise InvalidInstruction(instruction)
                return handle_insert(state, insert_name, insert_type, instruction)
            elif command_type == "ASSIGN":
                if len(parts) != 3:
                    raise InvalidInstruction(instruction)
                assign_name, assign_value = parts[1], parts[2]
                if " " in assign_name or " " in assign_value:
                    raise InvalidInstruction(instruction)
                if not is_identifier(assign_name):
                    raise InvalidInstruction(instruction)
                return handle_assign(state, assign_name, assign_value, instruction)
            elif command_type == "BEGIN":
                if len(parts) != 1 or stripped_instruction != "BEGIN":
                    raise InvalidInstruction(instruction)
                return handle_begin(state)
            elif command_type == "END":
                if len(parts) != 1 or stripped_instruction != "END":
                    raise InvalidInstruction(instruction)
                return handle_end(state, instruction)
            elif command_type == "LOOKUP":
                if len(parts) != 2 or " " in parts[1]:
                    raise InvalidInstruction(instruction)
                lookup_name = parts[1]
                if not is_identifier(lookup_name):
                    raise InvalidInstruction(instruction)
                return handle_lookup(state, lookup_name, instruction)
            elif command_type == "PRINT":
                if len(parts) != 1 or stripped_instruction != "PRINT":
                    raise InvalidInstruction(instruction)
                return handle_print(state)
            elif command_type == "RPRINT":
                if len(parts) != 1 or stripped_instruction != "RPRINT":
                    raise InvalidInstruction(instruction)
                return handle_rprint(state)
            else:
                raise InvalidInstruction(instruction)
        except StaticError as e:
            raise e
    try:
        final_state = reduce(process_command, list_of_commands, initial_state)
    except StaticError as e:
        raise e
    final_symbol_table, final_results, final_level = final_state
    if final_level > 0:
        raise UnclosedBlock(final_level)
    return final_results
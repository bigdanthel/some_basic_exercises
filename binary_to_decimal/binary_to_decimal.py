def is_valid_binary(s):
    return bool(s) and all(c in '01' for c in s)


def binary_to_decimal(binary_str):
    return int(binary_str, 2)


def main():
    while True:
        user_input = input("Enter a binary number (or 'exit' to quit): ").strip()
        if user_input.lower() == "exit":
            break
        if is_valid_binary(user_input):
            print(f"Decimal: {binary_to_decimal(user_input)}")
        else:
            print("Invalid input! Please enter a string containing only 0s and 1s.")


if __name__ == "__main__":
    main()

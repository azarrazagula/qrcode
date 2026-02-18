const ReusableInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
  buttonText,
  onButtonClick,
  buttonDisabled,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder:text-gray-400"
        />
        {buttonText && (
          <button
            onClick={onButtonClick}
            disabled={buttonDisabled}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-sm sm:text-base hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReusableInput;

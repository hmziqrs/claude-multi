import { useInput, useApp } from "ink";

export function useNavigation(onBack: () => void) {
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    } else if (input === "q") {
      exit();
    }
  });
}

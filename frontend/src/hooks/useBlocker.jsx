import React, { useContext, useEffect } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";

export function useBlocker(blocker, when = true) {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) return;

    const push = navigator.push;
    const replace = navigator.replace;

    navigator.push = (...args) => {
      blocker({ action: "PUSH", location: args[0], retry: () => push(...args) });
    };
    navigator.replace = (...args) => {
      blocker({ action: "REPLACE", location: args[0], retry: () => replace(...args) });
    };

    return () => {
      navigator.push = push;
      navigator.replace = replace;
    };
  }, [blocker, navigator, when]);
}

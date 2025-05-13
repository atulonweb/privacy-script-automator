
import * as React from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const onChange = () => {
      setMatches(mediaQuery.matches);
    };
    
    // Set initial value
    onChange();
    
    // Listen for changes
    mediaQuery.addEventListener("change", onChange);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
}

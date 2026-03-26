import { createContext, useContext } from 'react'

const ThemeContext = createContext({ mode: 'dark', toggle: () => {} })

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ mode: 'dark', toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext)
}

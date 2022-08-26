import * as React from "react";

export type {{name}}ProviderProps = {
   children: React.ReactNode 
 }

const {{name}}Provider: React.FC<{{name}}ProviderProps> = ({children}) => {
  return (
    <>
      {children}
    </>
);}


export default {{name}}Provider

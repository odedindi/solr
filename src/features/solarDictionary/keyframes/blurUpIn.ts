import { keyframes } from "@mantine/core"

export const blurUpIn = keyframes`
  0%   { 
      transform: translate(0px, 25px);
      -filter: blur(10px);
      -webkit-filter: blur(10px);
  }
  25% {
      transform: translate(0px, 20px);
      
  }
  50% {
      transform: translate(0px, 15px);
      
  }
  75% {
      transform: translate(0px, 10px);
      -filter: blur(5px);
      -webkit-filter: blur(5px);
  }
  85% {
    transform: translate(0px, 5px);
    -filter: blur(3px);
    -webkit-filter: blur(3px);
  }
  100% {
    transform: translate(0px, 0px);
    -filter: blur(0px);
    -webkit-filter: blur(0px);
  }
    `

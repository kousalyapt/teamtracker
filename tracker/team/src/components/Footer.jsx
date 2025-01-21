// import React, { useState, useEffect } from 'react';
// function Footer() {

//   const [isClicked, setIsClicked] = useState(false);

//   const handleHeartClick = () => {
//     setIsClicked(!isClicked);
//   };

//   return (
//     <div className='text-right'>Made by Kousalya <span
//     onClick={handleHeartClick}
//     className={`cursor-pointer ${
//       isClicked
//         ? 'fixed top-0 left-0 w-full h-full flex justify-center items-center bg-opacity-50'
//         : 'inline-block transform scale-100'
//     } transition-transform duration-300 ease-in-out`}
//   >
//     <span
//       className={`${
//         isClicked ? 'text-9xl animate-pulse' : 'text-base'
//       } transition-transform duration-500 ease-in-out`}
//     >
//       ❤️
//     </span>
//   </span></div>
//   )
// }

// export default Footer

import React, { useState } from 'react';

function Footer() {
  const [isClicked, setIsClicked] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);

  const handleHeartClick = () => {
    if (isClicked) {
      // Trigger break animation
      setIsBreaking(true);
      setTimeout(() => {
        setIsClicked(false); // Reset to original position after animation
        setIsBreaking(false); // Clear break state
      }, 600); // Duration should match the animation duration
    } else {
      setIsClicked(true); // Trigger the large heart effect
    }
  };

  return (
    <div className='text-right relative'>
      Made by Kousalya
      <span
        onClick={handleHeartClick}
        className={`cursor-pointer ${
          isClicked
            ? 'fixed top-0 left-0 w-full h-full flex justify-center items-center'
            : 'inline-block transform scale-100'
        } transition-transform duration-300 ease-in-out`}
      >
        <span
          className={`${
            isBreaking
              ? 'animate-break opacity-0' // Break effect animation
              : isClicked
              ? 'text-9xl animate-pulse' // Pulsing effect when clicked
              : 'text-base'
          } transition-transform duration-500 ease-in-out`}
        >
          ❤️
        </span>
      </span>
    </div>
  );
}

export default Footer;

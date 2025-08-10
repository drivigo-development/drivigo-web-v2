import React, { useEffect } from 'react';

const Loader = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      .sky {
        height: 100vh;
        width: 100%;
        padding-bottom: 400px;
      }

      .highway {
        height: 200px;
        width: 1000%;
        background-image: url('https://i.imgur.com/bVXQ8P5.jpg');
        position: absolute;
        bottom: 0;
        z-index: 1;
        background-repeat: repeat;
        animation: highway 5s linear infinite;
      }

      @keyframes highway {
        100% {
          transform: translateX(-3000px);
        }
      }



      .car {
        width: 100px;
        left: 50%;
        bottom: 300px;
        transform: translateX(-50%);
        position: absolute;
        z-index: 2;
      }

      .car img {
        width: 100%;
        animation: car 1s linear infinite;
      }

      @keyframes car {
        0% { transform: translateY(-4px); }
        50% { transform: translateY(0); }
        100% { transform: translateY(-4px); }
      }

      .wheel-container {
        width: 196px;
        position: absolute;
        bottom: 305px;
        left: 49.9%;
        transform: translateX(-50%);
        display: flex;
        justify-content: space-between;
        padding: 0 60px;
        z-index: 2;
      }

      .wheel-container img {
        width: 15px;
        height: 15px;
        animation: wheel 1s linear infinite;
      }

      @keyframes wheel {
        100% {
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="sky bg-white">
      <div className="car">
        <img src="https://i.imgur.com/n947rWL.png" alt="Yellow Car" />
      </div>
      <div className="wheel-container">
        <img src="https://i.imgur.com/uZh01my.png" alt="Front Wheel" />
        <img src="https://i.imgur.com/uZh01my.png" alt="Back Wheel" />
      </div>
    </div>
  );
};

export default Loader;

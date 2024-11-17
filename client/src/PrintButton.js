import React from 'react';

const PrintButton = () => {
  const handlePrint = () => {
    window.print();
  };

  return <button onClick={handlePrint}>Print</button>;
};

export default PrintButton;

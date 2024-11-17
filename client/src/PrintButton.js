import React from 'react';

const PrintButton = () => {
  const handlePrint = () => {
    window.print();
  };

  return <button class="print-button" onClick={handlePrint}>Print</button>;
};

export default PrintButton;

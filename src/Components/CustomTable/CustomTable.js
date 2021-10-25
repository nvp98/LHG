import React from 'react';
import { Table } from 'antd';
import './CustomTable.scss';

const CustomTable = props => {
  return (
    <div
      className="tableWrap"
      style={{ marginTop: props.mgt ? props.mgt : undefined }}
    >
      <Table
        {...props}
        // rowClassName={(record, index) =>
        //   index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
        // }
        bordered
      />
    </div>
  );
};

export default CustomTable;

import { Checkbox, Col, Row } from 'antd';
import { getModule } from 'Api';
import React, { useEffect, useState } from 'react';
import './CustomCheckBox.scss';

const CustomCheckBox = props => {
  const { check, disable } = props;
  const [checkList, setCheckList] = useState();
  const [checkMain, setCheckMain] = useState([]);
  const [listFunc, setListFunc] = useState();
  const [itemCheck, setItemCheck] = useState([]);

  useEffect(() => {
    initData();
  }, [check]);
  const initData = async () => {
    try {
      const { data } = await getModule({
        sortBy: 'order',
        sortType: 'ASC',
      });
      // const itemcheck = data.items.map(() => []);
      // setItemCheck(itemcheck);
      setCheckList(data.items);
      let listfunc = [];
      data.items.map(i => {
        return listfunc.push(i.functions);
      });
      let checkMo = [];
      check.map((item, index) => {
        if (
          item.filter(i => i === true).length ===
          data.items[index]?.functions?.length
        )
          return (checkMo[index] = true);
      });
      setCheckMain(checkMo);
      setListFunc(listfunc);
      setItemCheck(check);
      sendData(check);
    } catch (error) {
      console.log(error);
    }
  };

  const onChange = (e, index) => {
    let check = [...checkMain];
    check[index] = e.target.checked;
    setCheckMain(check);
    let itemcheck = [...itemCheck];
    let listcheckfunc = [];

    listFunc[index].map(ins => {
      return listcheckfunc.push(e.target.checked);
    });

    itemcheck[index] = listcheckfunc;
    setItemCheck(itemcheck);
    sendData(itemcheck);
  };

  const onChangeItem = (e, i, index) => {
    let itemcheck = [...itemCheck];
    let checkMo = [...checkMain];
    itemcheck[index][i] = e.target.checked;
    //change checked module
    if (checkMo[index] === true) checkMo[index] = e.target.checked;
    // CheckAll funtion
    let k = 0;
    itemcheck[index].map(ins => {
      if (ins) {
        return (k = k + 1);
      }
    });
    if (k === listFunc[index].length) checkMo[index] = e.target.checked; //set checked Module
    setCheckMain(checkMo);
    setItemCheck(itemcheck);
    sendData(itemcheck);
  };

  const sendData = itemcheck => {
    let listCheck = [];

    itemcheck.map((item, index) => {
      item.map((i, ins) => {
        if (i) {
          let c = { functionId: listFunc[index][ins].id, allow: true };
          return listCheck.push(c);
        }
      });
    });
    props.parentCallback(listCheck);
  };

  return (
    <Row xs={24} sm={24} md={24} lg={24} xl={24} className="checkBox">
      {checkList?.map((items, index) => {
        return (
          <Col xs={6} sm={6} md={6} lg={6} xl={6} key={index}>
            <Row style={{ marginBottom: '10px' }}>
              <Checkbox
                value={items.id}
                className="check_total"
                onChange={e => onChange(e, index)}
                checked={checkMain[index]}
                disabled={disable}
              >
                {items.name}
              </Checkbox>
            </Row>
            {items.functions
              .sort((a, b) => parseFloat(a.order) - parseFloat(b.order))
              .map((item, i) => {
                return (
                  <Row style={{ marginBottom: '10px' }} key={i}>
                    <Checkbox
                      value={item.id}
                      className="check_item"
                      checked={itemCheck.length > 0 && itemCheck[index][i]}
                      onChange={e => onChangeItem(e, i, index)}
                      disabled={disable}
                    >
                      {item.name}
                    </Checkbox>
                  </Row>
                );
              })}
          </Col>
        );
      })}
    </Row>
  );
};

export default CustomCheckBox;

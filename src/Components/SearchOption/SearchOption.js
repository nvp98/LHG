import { Col, DatePicker, Input, Row, Select, Checkbox } from 'antd';
import { DATE_FORMAT } from 'GlobalConstants';
import _, { debounce } from 'lodash';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { paramsTableSelector } from 'Selectors';
import './SearchOption.scss';

const { RangePicker } = DatePicker;

const SearchOption = props => {
  const paramsTable = useSelector(state =>
    paramsTableSelector(state.searchReducer)
  );

  const { columnFilter, lg, xl } = props;

  const emitChangeFilter = (key, value = undefined) => {
    const { fetchDataTable } = props;
    const filterParams = { ...paramsTable };
    if (Array.isArray(key) && Array.isArray(value)) {
      key.forEach(
        (item, index) =>
          (filterParams[item] = value[index]
            ? ('' + value[index]).trim()
            : undefined)
      );
    } else {
      // set `undefined` to remove that key from url
      filterParams[key] = value ? ('' + value).trim() : undefined;
    }

    filterParams.page = 1;
    fetchDataTable({ ...filterParams }, {});

    // if (signal) {
    //   signal.cancel('Canceled');
    // }

    //cancel last token when change filter
    // const signal = axios.CancelToken.source();
    // fetchData(
    //   { ...filterParams }
    // , signal.token
    // );
  };

  const emitChangeDebounced = debounce(emitChangeFilter, 300);

  useEffect(() => {
    return () => {
      emitChangeDebounced.cancel();
    };
  }, [paramsTable]);

  const handleChangeInput = e => {
    const { target } = e;
    emitChangeDebounced(target.name, target.value);
  };
  const handleChangeChekBox = e => {
    const { target } = e;
    emitChangeDebounced(target.name, target.checked.toString());
  };

  const handleChangeSelect = name => value => {
    emitChangeDebounced(name, value);
  };

  // onchange range picker
  const handleChangeRangePicker = (dateMoment, dateString, name) => {
    const dateSearch = [];
    if (dateMoment) {
      dateSearch.push(dateMoment[0].format());
      dateSearch.push(dateMoment[1].format());
    } else {
      dateSearch.push(undefined);
      dateSearch.push(undefined);
    }
    emitChangeDebounced(name, dateSearch);
  };

  const handleChangeCalendar = (dateMoment, dateString, name) => {
    const dateSearch = dateMoment ? dateMoment.format() : undefined;
    emitChangeDebounced(name, dateSearch);
  };

  return (
    <div className="search-wapper">
      {columnFilter && columnFilter.length > 0 && !_.isEmpty(paramsTable) && (
        <div className="">
          <Row>
            {columnFilter.map((item, index) => {
              switch (item.type) {
                case 'input':
                  return (
                    <Col
                      xs={24}
                      sm={24}
                      md={8}
                      lg={lg ? lg : 6}
                      xl={xl ? xl : 6}
                      key={index}
                    >
                      <div className="form-item">
                        <label>{item.label}</label>
                        <Input
                          {...item}
                          onChange={handleChangeInput}
                          defaultValue={paramsTable[item.name]}
                        />
                      </div>
                    </Col>
                  );
                case 'select':
                  return (
                    <Col
                      xs={24}
                      sm={24}
                      md={8}
                      lg={lg ? lg : 6}
                      xl={xl ? xl : 6}
                      key={index}
                    >
                      <div className="form-item">
                        <label>{item.label}</label>
                        <Select
                          defaultValue={
                            item.mode === 'multiple'
                              ? !_.isEmpty(paramsTable[item.name])
                                ? paramsTable[item.name]
                                    ?.split(',')
                                    .map(i => Number(i))
                                : []
                              : paramsTable[item.name] || item.defaultValue
                          }
                          style={{ width: '100%' }}
                          onChange={handleChangeSelect(item.name)}
                          maxTagCount={1}
                          optionFilterProp={item.optionFilterProp}
                          placeholder={item.placeholder}
                          mode={item.mode}
                          showSearch={item.showSearch}
                        >
                          {item?.options?.map((option, index) => {
                            return (
                              <Select.Option
                                value={option.key}
                                key={option.key}
                              >
                                {option.name}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </div>
                    </Col>
                  );
                case 'datePicker':
                  return (
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} key={index}>
                      <div className="form-item">
                        <label>{item.label}</label>
                        <DatePicker
                          {...item}
                          defaultValue={
                            paramsTable[item.name] || item.defaultValue
                          }
                          // defaultValue={moment()}
                          // format={'MM/YYYY'}
                          // placeholder={item.placeholder}
                          style={{ width: '100%' }}
                          onChange={(date, dateS) =>
                            handleChangeCalendar(date, dateS, item.name)
                          }
                        />
                      </div>
                    </Col>
                  );
                case 'inputNumber':
                  return (
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} key={index}>
                      <div className="form-item">
                        <label>{item.label}</label>
                        <Input
                          {...item}
                          type="number"
                          onChange={handleChangeInput}
                          defaultValue={paramsTable[item.name]}
                        />
                      </div>
                    </Col>
                  );
                case 'rangePicker':
                  return (
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} key={index}>
                      <div className="form-item">
                        <label>{item.label}</label>
                        <RangePicker
                          {...item}
                          format={DATE_FORMAT}
                          onChange={(date, dateS) =>
                            handleChangeRangePicker(date, dateS, item.name)
                          }
                          defaultValue={[
                            paramsTable.from ? moment(paramsTable.from) : null,
                            paramsTable.to ? moment(paramsTable.to) : null,
                          ]}
                        />
                      </div>
                    </Col>
                  );
                case 'checkbox':
                  return (
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} key={index}>
                      <div className="form-item">
                        <Checkbox
                          {...item}
                          onChange={handleChangeChekBox}
                          defaultChecked={
                            paramsTable[item.name] === 'true' ||
                            item.defaultValue
                          }
                        />
                        <label style={{ marginLeft: '10px' }}>
                          {item.label}
                        </label>
                      </div>
                    </Col>
                  );
                default:
                  return null;
              }
            })}
          </Row>
        </div>
      )}
    </div>
  );
};

export default SearchOption;

import React, { useState, useEffect } from 'react';
import { getPackageDetail } from 'Api';
import { TOKEN_KEY } from 'GlobalConstants';
import { setCookie } from 'Utils/Helpers';
import './ViewPromotion.scss';

const ViewPromotion = props => {
  const { match } = props;
  const id = match.params.id;
  const lang = match.params.lang;
  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams && urlParams.get('token');

  const [viewDetails, setViewdetails] = useState({});
  useEffect(() => {
    myParam && setCookie(TOKEN_KEY, myParam);
    getPackageDetail(id)
      .then(item => {
        const Promot = item.data.promotionsDetails.find(
          i => i.languageId == lang
        );
        setViewdetails(Promot);
      })
      .catch(err => console.log(err));
  }, []);
  return (
    <div
      className="view-promotion"
      dangerouslySetInnerHTML={{ __html: viewDetails.content }}
    ></div>
  );
};

export default ViewPromotion;

import React, { Suspense } from "react";
import { Spin } from "antd";

export const PublicLayout = (props) => (
  <Suspense
    fallback={
      <Spin>
        <div className="is-spining-full"></div>
      </Spin>
    }
  >
    <div className="public-layout">{props.children}</div>
  </Suspense>
);

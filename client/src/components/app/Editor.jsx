import React from "react";
import SunEditor, { buttonList } from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";

function Editor({ setProduct, ...properties }) {
  return (
    <div>
      <SunEditor
        {...properties}
        onChange={(content) => {
          setProduct((currentProduct) => ({
            ...currentProduct,
            description: content,
          }));
        }}
        setOptions={{
          buttonList: buttonList.formatting,
        }}
        setDefaultStyle="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;"
      />
    </div>
  );
}

export default Editor;

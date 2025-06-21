import React from 'react';
import SunEditor, { buttonList } from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

function Editor({ setProduct, product, ...properties }) {
  const { description } = product || {};
  return (
    <div>
      <SunEditor
        defaultValue={description}
        {...properties}
        onChange={(content) => {
          setProduct((currentProduct) => ({
            ...currentProduct,
            description: content,
          }));
        }}
        setOptions={{
          buttonList: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            [
              'bold',
              'underline',
              'italic',
              'strike',
              // "subscript",
              // "superscript",
            ],
            ['align', 'horizontalRule', 'list', 'lineHeight'],
            ['outdent', 'indent'],

            ['removeFormat'],
            ['fontColor', 'hiliteColor'],
            ['indent', 'outdent'],
            ['align', 'horizontalRule', 'list', 'table'],
            ['link', 'image', 'video'],
            ['fullScreen', 'showBlocks', 'codeView', 'preview'],
          ],
          lineHeights: [
            { text: '1', value: 1 },
            { text: '1.15', value: 1.15 },
            { text: '1.5', value: 1.5 },
            { text: '2', value: 2 },
          ],
          colorList: [
            [
              '#ff0000',
              '#ff5e00',
              '#ffe400',
              '#abf200',
              '#00d8ff',
              '#0055ff',
              '#6600ff',
              '#ff00dd',
              '#000000',
              '#ffd8d8',
              '#fae0d4',
              '#faf4c0',
              '#e4f7ba',
              '#d4f4fa',
              '#d9e5ff',
              '#e8d9ff',
              '#ffd9fa',
              '#f1f1f1',
              '#ffa7a7',
              '#ffc19e',
              '#faed7d',
              '#cef279',
              '#b2ebf4',
              '#b2ccff',
              '#d1b2ff',
              '#ffb2f5',
              '#bdbdbd',
              '#f15f5f',
              '#f29661',
              '#e5d85c',
              '#bce55c',
              '#5cd1e5',
              '#6699ff',
              '#a366ff',
              '#f261df',
              '#8c8c8c',
              '#980000',
              '#993800',
              '#998a00',
              '#6b9900',
              '#008299',
              '#003399',
              '#3d0099',
              '#990085',
              '#353535',
              '#670000',
              '#662500',
              '#665c00',
              '#476600',
              '#005766',
              '#002266',
              '#290066',
              '#660058',
              '#222222',
            ],
          ],

          imageUploadUrl: '',
          imageAccept: '.jpg, .jpeg, .png, .gif',
          imageUploadSizeLimit: 5242880,
          videoFileInput: true,
          videoAccept: '.mp4, .webm, .ogg',
          videoUploadSizeLimit: 10485760,
          previewTemplate: true,
        }}
        setDefaultStyle="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;"
      />
    </div>
  );
}

export default Editor;

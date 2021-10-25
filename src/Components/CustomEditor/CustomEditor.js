import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './CustomEditor.scss';
import { EDITOR_KEY } from 'GlobalConstants';
import { uploadAttachmentFile, downloadAttachmentFile } from 'Api';
import { convertBufferBase64 } from 'Utils/Helpers';
// import WorkWeek from 'Components/WorkWeek/workWeek';

const CustomEditor = props => {
  // console.log(props.value, 'value');
  return (
    <div className="editor">
      <Editor
        apiKey={EDITOR_KEY}
        value={props.value}
        // initialValue={props.value}
        onEditorChange={props.onChange}
        init={{
          selector: '#editor',
          inline_styles: {
            border: '1px solid red',
          },
          // skin_url: './editorTheme/',
          menubar: false,
          branding: false,
          template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
          template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
          height: 400,
          width: '100%',
          image_caption: true,
          elementpath: false,
          fontsize_formats:
            '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 22pt 24pt 32pt 48pt',
          quickbars_selection_toolbar:
            'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
          noneditable_noneditable_class: 'mceNonEditable',
          toolbar_mode: 'scrolling',
          image_advtab: true,
          image_caption: true,
          relative_urls: false,
          remove_script_host: false,
          images_upload_handler: async function (
            blobInfo,
            success,
            fail,
            progress
          ) {
            //Check if file size larger than 1MB
            if (blobInfo.blob().size / (1024 * 1024) > 1) {
              fail(
                'Bạn không được phép tải lên tệp có kích thước lớn hơn 1MB.'
              );
            }
            const formData = new FormData();
            formData.append('files', blobInfo.blob(), blobInfo.filename());
            formData.append('isEditor', true);
            try {
              const responseUpload = await uploadAttachmentFile(formData);

              success(responseUpload.data[0].url);
            } catch (error) {
              console.log(error);
              fail('HTTP Error: ' + error, { remove: true });
              return;
            }
          },
          file_picker_callback: (callback, value, meta) => {
            if (meta.filetype === 'image') {
              let input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');

              input.onchange = function () {
                const file = this.files[0];

                let reader = new FileReader();
                reader.onload = function () {
                  const id = 'blobid' + new Date().getTime();
                  const blobCache =
                    window.tinymce.activeEditor.editorUpload.blobCache;
                  const base64 = reader.result.split(',')[1];
                  const blobInfo = blobCache.create(id, file, base64);
                  blobCache.add(blobInfo);
                  const formData = new FormData();
                  formData.append(
                    'files',
                    blobInfo.blob(),
                    blobInfo.filename()
                  );
                  formData.append('isEditor', true);

                  uploadAttachmentFile(formData)
                    .then(res => {
                      let img = new Image();
                      img.src = res.data[0].url;
                      img.onload = () => {
                        callback(res.data[0].url, {
                          title: file.name,
                          width: '320px',
                          height: Math.ceil((320 * img.height) / img.width),
                        });
                      };
                    })
                    .catch(error => {
                      window.tinymce.activeEditor.windowManager.alert(
                        'Bạn không được phép tải lên tệp có kích thước lớn hơn 1MB.'
                      );
                    });
                };
                reader.readAsDataURL(file);
              };
              input.click();
            }
          },
          setup: function (ed) {
            ed.on('init', function () {
              this.getDoc().body.style.fontSize = '10';
              this.getDoc().body.style.fontFamily = 'Open Sans, sans-serif';
            });
          },
          quickbars_insert_toolbar: false,
          inline: false,
          content_css:
            "@import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');",
          content_style:
            'p { margin: 0.25rem auto} h1 { line-height: 0.7 !important}',
          font_formats: `Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica;Open Sans=Open Sans, sans-serif;Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats`,
          plugins: 'image link table lists',
          toolbar:
            'bold italic underline | fontselect fontsizeselect forecolor | alignleft aligncenter alignright alignjustify | numlist bullist |  table image link undo redo |',
          table_default_styles: {
            width: '99%',
            // height: '100vh',
            // border: '1px solid #000',
            'background-color': '#fff',
          },
          table_style_by_css: true,
          object_resizing: ':not(table)',
        }}
      />
    </div>
  );
};

export default CustomEditor;

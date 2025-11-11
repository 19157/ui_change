import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input, Button, Tooltip, Upload, UploadFile, UploadProps } from "antd";
import classNames from "classnames";
import { TextAreaRef } from "antd/es/input/TextArea";
import { getOS, showMessage } from "@/utils";
import { CloseCircleOutlined, PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import "./index.css";

const { TextArea } = Input;

type Props = {
  placeholder: string;
  showBtn: boolean;
  disabled: boolean;
  size: string;
  product?: CHAT.Product;
  send: (p: CHAT.TInputInfo) => void;
  dbsShow?: (show: boolean) => void;
  newSessionId?: string;
};

const GeneralInput: GenieType.FC<Props> = (props) => {
  const { placeholder, showBtn, disabled, product, send, dbsShow } = props;
  const [question, setQuestion] = useState<string>("");
  const [deepThink, setDeepThink] = useState<boolean>(false);
  const [searchEnabled, setSearchEnabled] = useState<boolean>(false);
  const textareaRef = useRef<TextAreaRef>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const tempData = useRef<{
    cmdPress?: boolean;
    compositing?: boolean;
  }>({});

  const uploadProps: UploadProps = {
    multiple: true,
    beforeUpload: (file, list) => {
      if (fileList.length + list.length > 5) {
        showMessage()?.info("附件最多支持5个");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showMessage()?.info("单个文件大小5M以内");
        return false;
      }
      setFileList((fileList) => [...fileList, file]);
      return true;
    },
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: (percent) => percent && `${Number.parseFloat(percent.toFixed(2))}%`,
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log('文件上传中...');
      }
      if (info.file.status === 'done') {
        console.log('文件上传成功');
      } else if (info.file.status === 'error') {
        console.log('文件上传失败');
      }
    },
    fileList,
    showUploadList: false,
  };

  const translateSize = (size: number) => {
    if (size < 1024) {
      return `${size}B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)}KB`;
    }
    return `${(size / 1024 / 1024).toFixed(2)}MB`;
  };

  const deleteFile = (index: number) => {
    setFileList((fileList) => fileList.filter((_, i) => i !== index));
  };

  const questionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  const changeThinkStatus = () => {
    setDeepThink(!deepThink);
  };

  const changeSearchStatus = () => {
    setSearchEnabled(!searchEnabled);
  };

  const pressEnter: React.KeyboardEventHandler<HTMLTextAreaElement> = () => {
    if (tempData.current.compositing) {
      return;
    }
    // 按住command 回车换行逻辑
    if (tempData.current.cmdPress) {
      const textareaDom = textareaRef.current?.resizableTextArea?.textArea;
      if (!textareaDom) {
        return;
      }
      const { selectionStart, selectionEnd } = textareaDom || {};
      const newValue =
        question.substring(0, selectionStart) +
        "\n" + // 插入换行符
        question.substring(selectionEnd!);

      setQuestion(newValue);
      setTimeout(() => {
        textareaDom.selectionStart = selectionStart! + 1;
        textareaDom.selectionEnd = selectionStart! + 1;
        textareaDom.focus();
      }, 20);
      return;
    }
    // 屏蔽状态，不发
    if (!question || disabled) {
      return;
    }
    // 新建对话：先网络请求创建对话，再执行以下流程；如创建失败则直接return
    // 历史对话：发送成功后再执行以下流程；如发送失败则直接return
    if (!question.trim()) {
      showMessage()?.info('输入为空');
      return;
    }
    send({
      message: question,
      outputStyle: product?.type,
      deepThink,
      searchEnabled,
    });

    setTimeout(() => {
      setQuestion("");
    });
  };

  const sendMessage = () => {
    // 新建对话：先网络请求创建对话，再执行以下流程；如创建失败则直接return
    // 历史对话：发送成功后再执行以下流程；如发送失败则直接return
    if (!question.trim()) {
      showMessage()?.info('输入为空');
      return;
    }
    send({
      message: question,
      outputStyle: product?.type,
      deepThink,
      searchEnabled,
    });
    setQuestion("");
  };

  const enterTip = useMemo(() => {
    return `⏎发送，${getOS() === "Mac" ? "⌘" : "^"} + ⏎ 换行`;
  }, []);

  useEffect(() => {
    setQuestion('');
  }, [props.newSessionId]);

  return (
    <div className={showBtn ? "rounded-[12px] p-1" : ""}>
      {fileList.length > 0 && (
        <div className="upload-list">
          {fileList.map((file: any, index: number) => {
            return (
              <div className={`file-item`} key={index}>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                  <span className="file-name" title={file.name}>
                    {file.name}
                  </span>
                </div>
                <span>
                  {file.progress}
                </span>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <PaperClipOutlined className="file-icon" />
                  <span className="file-size">({translateSize(file.size)})</span>
                </div>
                <span
                  className="delete"
                  onClick={() => {
                    deleteFile(index);
                  }}
                >
                  <CloseCircleOutlined />
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div className="rounded-[12px] border border-[#E9E9F0] overflow-hidden p-[12px] bg-[#fff]">
        <div className="relative">
          <TextArea
            ref={textareaRef}
            value={question}
            placeholder={placeholder}
            className={classNames("h-62 no-border-textarea border-0 resize-none p-[0px] focus:border-0 bg-[#fff]", showBtn && product ? "indent-86" : "")}
            onChange={questionChange}
            onPressEnter={pressEnter}
            onKeyDown={(event) => {
              tempData.current.cmdPress = event.metaKey || event.ctrlKey;
            }}
            onKeyUp={() => {
              tempData.current.cmdPress = false;
            }}
            onCompositionStart={() => {
              tempData.current.compositing = true;
            }}
            onCompositionEnd={() => {
              tempData.current.compositing = false;
            }}
          />
          {showBtn && product ? (
            <div className="h-[24px] w-[80px] absolute top-0 left-0 flex items-center justify-center rounded-[6px] bg-[#f4f4f9] text-[12px] ">
              <i className={`font_family ${product.img} ${product.color} text-14`}></i>
              <div className="ml-[6px]">{product.name}</div>
            </div>
          ) : null}
        </div>
        <div className="h-30 flex justify-between items-center mt-[6px]">
          {showBtn ? (
            <div>
              <Button
                color={deepThink ? "primary" : "default"}
                variant="outlined"
                className={classNames(
                  `text-[12px] p-[8px] h-[28px] transition-all hover:bg-[rgba(64,64,255,0.02)] hover:border-[rgba(64,64,255,0.2)] ${deepThink ? "hover:text-#4040ffb2" : "hover:text-[#333]"}`
                )}
                onClick={changeThinkStatus}
              >
                <i className="font_family icon-shendusikao"></i>
                <span className="ml-[-4px]">深度研究</span>
              </Button>
              <Button
                color={searchEnabled ? "primary" : "default"}
                variant="outlined"
                className={classNames(
                  `text-[12px] ml-10 p-[8px] h-[28px] transition-all hover:bg-[rgba(64,64,255,0.02)] hover:border-[rgba(64,64,255,0.2)] ${searchEnabled ? "hover:text-#4040ffb2" : "hover:text-[#333]"}`
                )}
                onClick={changeSearchStatus}
              >
                <i className="font_family icon-lianwangsousuo"></i>
                <span className="ml-[-4px]">联网搜索</span>
              </Button>
              {/* {product?.type === "dataAgent" && (
                <Tooltip placement="right" title="查看知识库">
                <i
                  className="font_family icon-zhishiku cursor-pointer text-[#4040ffb2] text-[18px] ml-[8px] border border-[#4040ffb2] rounded-tr-lg rounded-bl-lg p-[3px]"
                  onClick={() => dbsShow && dbsShow(true)}
                ></i>
                </Tooltip>
              )} */}
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex items-center">
            {/* <Upload {...uploadProps} disabled={disabled} customRequest={() => {}}>
              <Tooltip title="最多支持5个文件，单个文件大小5M以内">
                <UploadOutlined />
              </Tooltip>
            </Upload> */}
            <span className="text-[12px] text-gray-300 mr-8 ml-8 flex items-center">
              {enterTip}
            </span>
            <Tooltip title="发送">
              <i
                className={`font_family icon-fasongtianchong ${!question || disabled ? "cursor-not-allowed text-[#ccc] pointer-events-none" : "cursor-pointer"}`}
                onClick={sendMessage}
              ></i>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInput;

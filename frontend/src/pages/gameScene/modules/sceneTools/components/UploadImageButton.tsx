import { type MutableRefObject, useRef } from "react";
import { Button, type ButtonProps } from "primereact/button";
import { ImageIcon } from "../../../icons";
import handleImageUpload from "../handleImageUpload";
import type { PixiStage } from "../../sceneStage/pixiStage";

type UploadImageButtonProps = ButtonProps & { stageRef: MutableRefObject<PixiStage | null> };
const UploadImageButton = ({ stageRef }: UploadImageButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!stageRef.current) return null;
  const stage = stageRef.current;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            handleImageUpload(stage, file);
            // clear the input so the same file can be selected again if needed
            e.currentTarget.value = "";
          }
        }}
      />
      <Button
        aria-label="Add Image"
        text
        raised
        icon={<ImageIcon />}
        className={"tooltip-button"}
        onClick={() => {
          fileInputRef.current?.click();
        }}
      />
    </>
  );
};

export default UploadImageButton;

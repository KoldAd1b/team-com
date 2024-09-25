import { useCreateWorkspaceValues } from "@/hooks/create-workspace";
import { ImCancelCircle } from "react-icons/im";

import Image from "next/image";
import React from "react";
import { UploadDropzone } from "@/lib/uploadthing";

type Props = {};

const ImageUpload = (props: Props) => {
  const { imageUrl, updateImageUrl } = useCreateWorkspaceValues();

  if (imageUrl) {
    return (
      <div className="flex items-center justify-center size-32 relative">
        <Image
          src={imageUrl}
          className="object-cover w-full h-full rounded-md"
          alt="workspace"
          width={320}
          height={320}
        />
        <ImCancelCircle
          size={30}
          onClick={() => updateImageUrl("")}
          className="absolute cursor-pointer -right-2 -top-2 z-10 hover:scale-110"
        />
      </div>
    );
  }
  return (
    <UploadDropzone
      endpoint="workspaceImage"
      onClientUploadComplete={(res) => {
        updateImageUrl(res?.[0].url);
      }}
      onUploadError={(err) => console.log(err)}
    ></UploadDropzone>
  );
};

export default ImageUpload;

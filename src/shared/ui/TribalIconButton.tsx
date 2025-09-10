import { FC, ReactElement } from "react";
import { Image, ImageProps } from "@chakra-ui/react";
import TribalButton, { TribalButtonProps } from "./TribalButton";

/**
 * TribalIconButton Component
 * 
 * A button component with a Tribal Wars aesthetic that displays an image.
 * 
 * @param iconSrc - Source URL for the image
 * @param alt - Alt text for the image (defaults to "Tab icon")
 * @param imageSize - Size for the image (width and height in pixels, defaults to 15)
 * @param variant - Button style variant: "primary" (default), "secondary", or "icon"
 * @param size - Button size: "md" (default) or "sm"
 * @param children - Optional content to be displayed alongside the image
 */
export interface TribalIconButtonProps extends Omit<TribalButtonProps, 'leftIcon' | 'rightIcon'> {
  iconSrc: string;
  alt?: string;
  imageSize?: number;
}

const TribalIconButton: FC<TribalIconButtonProps> = ({
  iconSrc,
  alt = "Tab icon",
  imageSize = "15px",
  children,
  ...rest
}) => {
  // Create the image element to be used as the left icon
  const imageIcon = (
    <Image 
      width={`${imageSize}px`} 
      height={`${imageSize}px`} 
      src={iconSrc} 
      alt={alt}
    />
  );

  // Use the TribalButton component with the image as the left icon
  return (
    <TribalButton {...rest}>
      {imageIcon}
    </TribalButton>
  );
};

export default TribalIconButton;

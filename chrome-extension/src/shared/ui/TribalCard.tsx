import { FC, PropsWithChildren } from "react";

const TribalCard: FC<PropsWithChildren<{ title?: string, className?: string }>> = ({ title, children }) => {
    return (
        <div className="bg-[#f4e2c6] border-2 border-red-600 shadow-inner rounded-md p-2">
            {title && (
                <div className="bg-[#dbc2a3] border-2 border-red-700 px-2 py-1 font-semibold text-[#4a2c1a] text-sm">
                    {title}
                </div>
            )}
            <div className="px-2 py-1 text-sm text-[#3b2b1f]">{children}</div>
        </div>
    );
};

export default TribalCard;

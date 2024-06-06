import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const font = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const metadata: Metadata = {
    title: "three.js demo"
};

const Root: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <html lang="en">
            <body className={font.className}>
                {children}
            </body>
        </html>
    );
}

export { metadata };
export default Root;

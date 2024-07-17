import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const NotConnected = () => {
    return (
        <div className="text-white m-10 p-10">
            <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                    Veuillez connecter votre portefeuille pour accéder à notre
                    application.
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default NotConnected;

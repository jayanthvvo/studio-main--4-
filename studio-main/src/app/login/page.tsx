import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { ThesisFlowLogo } from "@/components/logo";
import Link from "next/link";
import { User, UserCog, Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <ThesisFlowLogo className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">ThesisFlow</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login As</CardTitle>
          <CardDescription>
            Please select your role to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild variant="outline">
            <Link href="/login/student">
              <User className="mr-2" />
              Student
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login/supervisor">
              <UserCog className="mr-2" />
              Supervisor
            </Link>
          </Button>
           <Button asChild variant="secondary">
            <Link href="/login/admin">
              <Shield className="mr-2" />
              Admin
            </Link>
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-center text-sm text-muted-foreground justify-center">
            <div className="flex items-center">New Student? <Button variant="link" asChild className="p-1"><Link href="/register/student">Register here</Link></Button></div>
            <div className="flex items-center">New Supervisor? <Button variant="link" asChild className="p-1"><Link href="/register/supervisor">Register here</Link></Button></div>
        </CardFooter>
      </Card>
    </div>
  );
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Pill, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // Kiểm tra lỗi từ URL
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.")
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        console.error("Login error:", result.error)
        setError("Tên đăng nhập hoặc mật khẩu không đúng.")
        toast({
          title: "Đăng nhập thất bại",
          description: "Tên đăng nhập hoặc mật khẩu không đúng.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Nếu đăng nhập thành công, chuyển hướng đến trang dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      setError("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.")
      toast({
        title: "Đăng nhập thất bại",
        description: "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-500 text-white p-1 rounded">
              <Pill className="h-6 w-6" />
            </div>
            <h1 className="font-bold text-2xl">PharmaCare</h1>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Đăng nhập</CardTitle>
                  <CardDescription>Nhập thông tin đăng nhập của bạn để truy cập hệ thống</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="username">Tên đăng nhập</Label>
                      <Input
                        id="username"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Link href="/forgot-password" className="text-xs text-blue-500 hover:underline">
                          Quên mật khẩu?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Đăng ký</CardTitle>
                  <CardDescription>Tạo tài khoản mới để sử dụng hệ thống</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Tên đăng nhập</Label>
                    <Input id="register-username" placeholder="Nhập tên đăng nhập" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" type="email" placeholder="Nhập email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <Input id="register-password" type="password" placeholder="Nhập mật khẩu" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Xác nhận mật khẩu</Label>
                    <Input id="register-confirm" type="password" placeholder="Xác nhận mật khẩu" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Đăng ký</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-blue-600 text-white p-12 flex-col justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-6">Quản lý nhà thuốc hiệu quả với PharmaCare</h2>
          <p className="text-blue-100 mb-8">
            Hệ thống giúp bạn tự động hóa các quy trình nhập hàng, bán hàng, quản lý kho, theo dõi khách hàng và tạo báo
            cáo chi tiết.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Pill className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Quản lý thuốc thông minh</h3>
                <p className="text-blue-100 text-sm">
                  Theo dõi hạn sử dụng, cảnh báo tồn kho, thông tin đầy đủ về thuốc
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Bán hàng dễ dàng</h3>
                <p className="text-blue-100 text-sm">Tạo hóa đơn nhanh chóng, tự động tính toán, in hóa đơn</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Báo cáo chi tiết</h3>
                <p className="text-blue-100 text-sm">Thống kê doanh thu, lợi nhuận, phân tích xu hướng bán hàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

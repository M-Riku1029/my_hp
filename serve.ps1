# PowerShell 簡易 HTTP サーバー（静的ファイル配信用）
$port = 3000
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$listener = [System.Net.HttpListener]::new()
# localhost プレフィックスを試す（127.0.0.1 より ACL 問題が起きにくい）
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Error "ポート $port でサーバーを起動できませんでした: $_"
    exit 1
}

Write-Host "Serving $root at http://localhost:$port"

while ($listener.IsListening) {
    $ctx  = $listener.GetContext()
    $req  = $ctx.Request
    $resp = $ctx.Response

    $path = $req.Url.LocalPath -replace '/', '\'
    if ($path -eq '\') { $path = '\index.html' }
    $file = Join-Path $root $path.TrimStart('\')

    if (Test-Path $file -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($file)
        $mime = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.css'  { 'text/css; charset=utf-8' }
            '.js'   { 'application/javascript; charset=utf-8' }
            default { 'application/octet-stream' }
        }
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $resp.ContentType     = $mime
        $resp.ContentLength64 = $bytes.Length
        $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $resp.StatusCode = 404
    }
    $resp.Close()
}

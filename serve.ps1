# Tiny static file server for previewing Ishana's Shop.
# Uses HttpListener: the OS parses each request, so idle/preconnect
# sockets never block us. No admin, no Node, no Python required.
$port = 8080
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$mime = @{
  ".html" = "text/html; charset=utf-8"; ".js" = "application/javascript; charset=utf-8";
  ".css" = "text/css; charset=utf-8"; ".json" = "application/json; charset=utf-8";
  ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg";
  ".gif" = "image/gif"; ".svg" = "image/svg+xml"; ".ico" = "image/x-icon"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$port  (Ctrl+C to stop)"

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()        # blocks until a COMPLETE request arrives
    $req = $context.Request
    $res = $context.Response

    $rawPath = $req.Url.AbsolutePath
    if ($rawPath -eq '/') { $rawPath = '/index.html' }
    $filePath = Join-Path $root ($rawPath.TrimStart('/').Replace('/', '\'))

    if (Test-Path $filePath -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $ct = $mime[$ext]; if (-not $ct) { $ct = "application/octet-stream" }
      $res.StatusCode = 200
      $res.ContentType = $ct
      $res.Headers["Cache-Control"] = "no-cache, no-store"
    } else {
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $res.StatusCode = 404
      $res.ContentType = "text/plain"
    }
    # Close(bytes, willBlock) sets Content-Length and writes the body in one safe call.
    $res.Close($bytes, $true)
    Write-Host ("{0} {1} -> {2}  ({3} bytes)" -f $req.HttpMethod, $rawPath, $res.StatusCode, $bytes.Length)
  } catch {
    Write-Host "ERR: $($_.Exception.Message)"
  }
}

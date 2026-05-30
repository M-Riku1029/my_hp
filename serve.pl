#!/usr/bin/perl
# 静的ファイル配信用シンプル HTTP サーバー
use strict;
use warnings;
use IO::Socket::INET;

my $port    = 8000;
my $docroot = do {
    use File::Basename;
    dirname(__FILE__);
};

# MIME タイプの定義
my %mime = (
    html => 'text/html; charset=utf-8',
    css  => 'text/css; charset=utf-8',
    js   => 'application/javascript; charset=utf-8',
    png  => 'image/png',
    jpg  => 'image/jpeg',
    jpeg => 'image/jpeg',
    gif  => 'image/gif',
    svg  => 'image/svg+xml',
    ico  => 'image/x-icon',
    json => 'application/json',
    txt  => 'text/plain; charset=utf-8',
);

# ソケットの作成
my $server = IO::Socket::INET->new(
    LocalAddr => '127.0.0.1',
    LocalPort => $port,
    Proto     => 'tcp',
    Type      => SOCK_STREAM,
    ReuseAddr => 1,
    Listen    => 50,
) or die "ポート $port でのサーバー起動に失敗しました: $!\n";

$| = 1;
print "Serving $docroot at http://localhost:$port\n";

# リクエスト処理ループ
while (my $client = $server->accept()) {
    $client->autoflush(1);

    # リクエストの最初の行を読む
    my $first_line = <$client>;
    unless (defined $first_line) {
        close($client);
        next;  # 空接続はスキップ（サーバーは継続）
    }

    # 残りのヘッダーを読み捨て
    while (my $line = <$client>) {
        last if $line =~ /^\r?\n$/;
    }

    # パスの抽出
    my (undef, $path) = split /\s+/, $first_line;
    $path //= '/';

    # クエリ文字列を除去
    $path =~ s/\?.*$//;

    # ルートを index.html に
    $path = '/index.html' if $path eq '/';

    # パストラバーサル防止
    $path =~ s|\.\.||g;
    $path =~ s|^/+||;

    # ファイルパスの構築（OS に応じてセパレーター調整）
    my $sep  = ($^O eq 'MSWin32' || $docroot =~ /\\/) ? '\\' : '/';
    my $file = $docroot . $sep . $path;
    $file =~ s|/|\\|g if $^O eq 'MSWin32';

    if (-f $file) {
        open(my $fh, '<:raw', $file) or do {
            my $body = "500 Internal Server Error\n";
            print $client "HTTP/1.0 500 Internal Server Error\r\n";
            print $client "Content-Length: " . length($body) . "\r\n\r\n";
            print $client $body;
            close($client);
            next;
        };
        local $/;
        my $content = <$fh>;
        close($fh);

        my ($ext) = $file =~ /\.([^.\\\/]+)$/;
        my $ct  = $mime{lc($ext // '')} // 'application/octet-stream';
        my $len = length($content);

        print $client "HTTP/1.0 200 OK\r\n";
        print $client "Content-Type: $ct\r\n";
        print $client "Content-Length: $len\r\n";
        print $client "Cache-Control: no-cache\r\n";
        print $client "\r\n";
        print $client $content;
    } else {
        my $body = "404 Not Found: $path\n";
        print $client "HTTP/1.0 404 Not Found\r\n";
        print $client "Content-Type: text/plain\r\n";
        print $client "Content-Length: " . length($body) . "\r\n\r\n";
        print $client $body;
    }

    close($client);
}

close($server);

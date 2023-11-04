export function log(msg) {
    process.stdout.cursorTo(0);
    process.stdout.write(msg + ' ');
}

export const functions = {
    getDiffInMins: (date2: Date, date1: Date): number => {
        return Math.round(
            (date2.getTime() - date1.getTime()) / 1000 / 60
        );
    },
    generateArray: (arraySize) => (Array(arraySize)),
    roundTo4Decimals: (number: number) => {
        return parseFloat(number.toFixed(4));
    },
    formatEmployeePosition: (employeePosition: string) => {
        let splittedPosition: string[] = employeePosition.split('_');
        splittedPosition.forEach((word, idx) => {
            let titlecasedWord = word[0].toUpperCase() + word.slice(1, word.length);

            splittedPosition[idx] = titlecasedWord;
        });

        return splittedPosition.join(' ');
    }
};
import fs from 'fs';
import * as path from 'path';

import { parse } from 'csv-parse';

import { Users } from './fixtures/userStates';
import { Admin } from './page-objects';
import { test, expect } from './utils/test';

test.use({ storageState: Users.admin.state });

type csvRoomSpec = {
	name: string;
	ownerUsername: string;
	visibility: 'public' | 'private';
	members: string;
};

const rowUserName: string[] = [];
const importedRooms: csvRoomSpec[] = [];
const slackCsvDir = path.resolve(__dirname, 'fixtures', 'files', 'slack_export_users.csv');
const zipCsvImportDir = path.resolve(__dirname, 'fixtures', 'files', 'csv_import.zip');

// These files have the same content from users.csv and channels.csv from the zip file
// They have been extracted just so that we don't need to do that on the fly
const usersCsvDir = path.resolve(__dirname, 'fixtures', 'files', 'csv_import_users.csv');
const roomsCsvDir = path.resolve(__dirname, 'fixtures', 'files', 'csv_import_rooms.csv');

const usersCsvsToJson = (): void => {
	fs.createReadStream(slackCsvDir)
		.pipe(parse({ delimiter: ',', from_line: 2 }))
		.on('data', (rows) => {
			rowUserName.push(rows[0]);
		});
	fs.createReadStream(usersCsvDir)
		.pipe(parse({ delimiter: ',' }))
		.on('data', (rows) => {
			rowUserName.push(rows[0]);
		});
};

const roomsCsvToJson = (): void => {
	fs.createReadStream(roomsCsvDir)
		.pipe(parse({ delimiter: ',' }))
		.on('data', (rows) => {
			importedRooms.push({
				name: rows[0],
				ownerUsername: rows[1],
				visibility: rows[2],
				members: rows[3],
			});
		});
};

test.describe.serial('imports', () => {
	test.beforeAll(() => {
		usersCsvsToJson();
		roomsCsvToJson();
	});

	test('expect import users data from slack', async ({ page }) => {
		const poAdmin: Admin = new Admin(page);
		await page.goto('/admin/import');

		await poAdmin.btnImportNewFile.click();

		await (await poAdmin.getOptionFileType("Slack's Users CSV")).click();

		await poAdmin.inputFile.setInputFiles(slackCsvDir);
		await poAdmin.btnImport.click();

		await poAdmin.btnStartImport.click();

		await expect(poAdmin.importStatusTableFirstRowCell).toBeVisible({
			timeout: 30_000,
		});
	});

	test('expect import users data from zipped CSV files', async ({ page }) => {
		const poAdmin: Admin = new Admin(page);
		await page.goto('/admin/import');

		await poAdmin.btnImportNewFile.click();

		await (await poAdmin.getOptionFileType('CSV')).click();

		await poAdmin.inputFile.setInputFiles(zipCsvImportDir);
		await poAdmin.btnImport.click();

		await poAdmin.btnStartImport.click();

		await expect(poAdmin.importStatusTableFirstRowCell).toBeVisible({
			timeout: 30_000,
		});
	});

	test('expect all imported users to be actually listed as users', async ({ page }) => {
		await page.goto('/admin/users');

		for (const user of rowUserName) {
			expect(page.locator(`tbody tr td:first-child >> text="${user}"`));
		}
	});

	test('expect all imported rooms to be actually listed as rooms', async ({ page }) => {
		const poAdmin: Admin = new Admin(page);
		await page.goto('/admin/rooms');

		for await (const room of importedRooms) {
			await poAdmin.inputSearchRooms.fill(room.name);

			const expectedMembersCount = room.members.split(';').filter((username) => username !== room.ownerUsername).length + 1;
			expect(page.locator(`tbody tr td:nth-child(2) >> text="${ expectedMembersCount }"`));

			await poAdmin.getRoomRow(room.name).click();
			room.visibility === 'private' ? await expect(poAdmin.privateInput).toBeChecked() : await expect(poAdmin.privateInput).not.toBeChecked();
			await expect(poAdmin.roomOwnerInput).toHaveValue(room.ownerUsername);
		}
	});
});

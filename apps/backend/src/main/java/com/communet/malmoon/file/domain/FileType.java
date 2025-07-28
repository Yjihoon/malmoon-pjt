package com.communet.malmoon.file.domain;

public enum FileType {
	AAC("aac"),
	PROFILE("profile"),
	RECORD("record");

	private final String directory;
	public String getDirectory() {
		return directory;
	}

	FileType(String directory) {
		this.directory = directory;
	}

}
